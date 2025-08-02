import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ethers } from "https://esm.sh/ethers@6"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { walletAddress, signature, nonce } = await req.json()

    if (!walletAddress || !signature || !nonce) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify nonce exists and is valid
    const { data: nonceData, error: nonceError } = await supabaseClient
      .from('auth_nonces')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('nonce', nonce)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (nonceError || !nonceData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired nonce' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create sign message
    const message = `Welcome to MetaBento!

Click to sign in and accept the MetaBento Terms of Service.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address:
${walletAddress}

Nonce:
${nonce}`

    // Verify signature
    let recoveredAddress
    try {
      recoveredAddress = ethers.verifyMessage(message, signature)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Signature verification failed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Mark nonce as used
    await supabaseClient
      .from('auth_nonces')
      .update({ used: true })
      .eq('id', nonceData.id)

    // Get or create user
    let userId: string
    let isNewUser = false

    const { data: existingUser, error: selectError } = await supabaseClient
      .from('users')
      .select('id, username')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (existingUser) {
      userId = existingUser.id
      
      // Update last login
      await supabaseClient
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId)
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabaseClient
        .from('users')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          last_login: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insertError || !newUser) {
        throw new Error(`Failed to create user: ${insertError?.message}`)
      }

      userId = newUser.id
      isNewUser = true

      // Create default settings for new user
      await supabaseClient
        .from('user_settings')
        .insert({ user_id: userId })

      // Create default level for new user
      await supabaseClient
        .from('user_levels')
        .insert({ user_id: userId, total_xp: 0 })
    }

    // Create session token
    const sessionToken = ethers.hexlify(ethers.randomBytes(32))
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 day expiry

    const { error: sessionError } = await supabaseClient
      .from('auth_sessions')
      .insert({
        user_id: userId,
        wallet_address: walletAddress.toLowerCase(),
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      })

    if (sessionError) {
      throw sessionError
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        sessionToken,
        userId,
        walletAddress: walletAddress.toLowerCase(),
        isNewUser,
        needsOnboarding: isNewUser,
        expiresAt: expiresAt.toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Wallet verification error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
