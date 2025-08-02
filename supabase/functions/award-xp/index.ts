import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { targetUserId, xpAmount, xpSource, description } = await req.json()

    if (!targetUserId || !xpAmount || !xpSource) {
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

    // Update user's A-Points
    const { error: pointsError } = await supabaseClient
      .from('users')
      .update({ 
        a_points: supabaseClient.sql`a_points + ${xpAmount}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)

    if (pointsError) {
      throw pointsError
    }

    // Update user levels (this will trigger level calculation via trigger)
    const { data: currentLevel, error: levelError } = await supabaseClient
      .from('user_levels')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (levelError && levelError.code !== 'PGRST116') {
      // If user level doesn't exist, create it
      const { error: createError } = await supabaseClient
        .from('user_levels')
        .insert({
          user_id: targetUserId,
          current_xp: xpAmount,
          total_xp: xpAmount
        })
    } else if (currentLevel) {
      // Update existing level
      const newTotalXP = currentLevel.total_xp + xpAmount
      const newCurrentXP = currentLevel.current_xp + xpAmount
      
      // Calculate new level based on total XP
      const newLevel = Math.floor(Math.sqrt(newTotalXP / 50)) + 1
      
      let levelName = 'Newcomer'
      if (newLevel <= 5) levelName = 'Newcomer'
      else if (newLevel <= 10) levelName = 'Networker'
      else if (newLevel <= 20) levelName = 'Connector'
      else if (newLevel <= 35) levelName = 'Influencer'
      else if (newLevel <= 50) levelName = 'Ambassador'
      else levelName = 'Legend'
      
      const nextLevelXP = Math.floor(100 * Math.pow(newLevel, 1.5) * 1.2)
      
      const { error: updateError } = await supabaseClient
        .from('user_levels')
        .update({
          current_xp: newCurrentXP,
          total_xp: newTotalXP,
          current_level: newLevel,
          level_name: levelName,
          next_level_xp: nextLevelXP,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUserId)

      if (updateError) {
        throw updateError
      }

      // Create level up notification if level increased
      if (newLevel > currentLevel.current_level) {
        await supabaseClient
          .from('user_notifications')
          .insert({
            user_id: targetUserId,
            notification_type: 'level_up',
            title: 'Level Up!',
            message: `Congratulations! You reached level ${newLevel} (${levelName})`,
            data: { new_level: newLevel, level_name: levelName }
          })
      }
    }

    // Log the XP transaction
    const { error: transactionError } = await supabaseClient
      .from('a_points_transactions')
      .insert({
        user_id: targetUserId,
        points_change: xpAmount,
        transaction_type: xpSource,
        description: description || `XP awarded: ${xpSource}`,
        metadata: { source: xpSource, amount: xpAmount }
      })

    if (transactionError) {
      console.error('Transaction log error:', transactionError)
      // Don't fail the whole operation for logging errors
    }

    // Check for achievements
    const { data: userStats } = await supabaseClient
      .from('user_levels')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (userStats) {
      const achievements = []
      
      // First connection achievement
      if (userStats.connections_made === 1 && xpSource === 'new_connection') {
        achievements.push({
          user_id: targetUserId,
          achievement_type: 'first_connection',
          achievement_name: 'First Connection',
          achievement_description: 'Made your first connection on MetaBento',
          points_awarded: 25
        })
      }
      
      // Networker achievement (10 connections)
      if (userStats.connections_made === 10) {
        achievements.push({
          user_id: targetUserId,
          achievement_type: 'networker',
          achievement_name: 'Networker',
          achievement_description: 'Made 10 connections',
          points_awarded: 50
        })
      }
      
      // Influencer achievement (level 20+)
      if (userStats.current_level >= 20) {
        const { data: existingAchievement } = await supabaseClient
          .from('user_achievements')
          .select('id')
          .eq('user_id', targetUserId)
          .eq('achievement_type', 'influencer')
          .single()
          
        if (!existingAchievement) {
          achievements.push({
            user_id: targetUserId,
            achievement_type: 'influencer',
            achievement_name: 'Influencer',
            achievement_description: 'Reached level 20',
            points_awarded: 100
          })
        }
      }

      // Insert achievements
      if (achievements.length > 0) {
        await supabaseClient
          .from('user_achievements')
          .insert(achievements)
          
        // Award achievement XP
        const totalAchievementXP = achievements.reduce((sum, ach) => sum + ach.points_awarded, 0)
        if (totalAchievementXP > 0) {
          await supabaseClient
            .from('users')
            .update({ a_points: supabaseClient.sql`a_points + ${totalAchievementXP}` })
            .eq('id', targetUserId)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        xpAwarded: xpAmount,
        source: xpSource,
        message: `Successfully awarded ${xpAmount} XP for ${xpSource}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Award XP error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to award XP' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
