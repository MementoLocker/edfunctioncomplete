import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, subject, message } = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get Resend API key from environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ error: 'Email service is not configured. Please contact support directly at support@mementolocker.com' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #C0A172 0%, #A68B5B 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">MementoLocker Website</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
          <div style="margin-bottom: 15px;">
            <strong style="color: #495057;">From:</strong>
            <span style="color: #6c757d;">${name} (${email})</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #495057;">Subject:</strong>
            <span style="color: #6c757d;">${subject}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #495057;">Submitted:</strong>
            <span style="color: #6c757d;">${new Date().toLocaleString('en-GB', { 
              timeZone: 'Europe/London',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} GMT</span>
          </div>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
          <h3 style="color: #495057; margin-top: 0;">Message:</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #C0A172;">
            <p style="margin: 0; color: #495057; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e9ecef;">
          
          <p style="color: #6c757d; font-size: 14px; margin: 0;">
            <strong>Reply Instructions:</strong> Simply reply to this email to respond directly to ${name} at ${email}
          </p>
        </div>
      </div>
    `

    const emailText = `
New Contact Form Submission from MementoLocker Website

From: ${name} (${email})
Subject: ${subject}
Submitted: ${new Date().toLocaleString('en-GB', { 
  timeZone: 'Europe/London',
  year: 'numeric',
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})} GMT

Message:
${message}

---
Reply directly to this email to respond to the user.
This message was sent through the MementoLocker contact form.
    `.trim()

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MementoLocker Contact Form <noreply@mementolocker.com>',
        to: ['support@mementolocker.com'],
        reply_to: email,
        subject: `Contact Form: ${subject}`,
        html: emailHtml,
        text: emailText,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult)
      throw new Error(`Failed to send email: ${emailResult.message || 'Unknown error'}`)
    }

    console.log('Email sent successfully:', {
      id: emailResult.id,
      from: name,
      email: email,
      subject: subject,
      timestamp: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully! We\'ll get back to you within 24 hours.',
        emailId: emailResult.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    
    // Provide helpful error message
    const errorMessage = error.message?.includes('Failed to send email') 
      ? 'Failed to send message. Please try again or contact us directly at support@mementolocker.com'
      : 'An unexpected error occurred. Please contact us directly at support@mementolocker.com'
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        directEmail: 'support@mementolocker.com'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})