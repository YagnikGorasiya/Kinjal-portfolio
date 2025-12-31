import { Box, Button, Container, IconButton, Link, Stack, TextField, Tooltip, Typography, Alert } from '@mui/material'
import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import contact from '../../data/contact.json'
import footer from '../../data/footer.json'
import { shouldReduceMotion } from '../../utils/motion'

gsap.registerPlugin(ScrollTrigger)

type ContactData = {
  heading: string
  friendlyMessage: string
  form?: {
    nameLabel: string
    emailLabel: string
    messageLabel: string
    submitText: string
  }
}

type FooterInfo = { email?: string; signoff?: string }

const data = contact as ContactData
const footerInfo = footer as FooterInfo

export default function Contact() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useLayoutEffect(() => {
    if (!rootRef.current) return
    const reduce = shouldReduceMotion()
    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('.contact-col')
      targets.forEach((el, i) => {
        const from = { autoAlpha: 0, y: 24 }
        const to = reduce
          ? { autoAlpha: 1, y: 0, duration: 0 }
          : { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: i * 0.05, scrollTrigger: { trigger: el, start: 'top 85%' } }
        gsap.fromTo(el, from, to as any)
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      // Netlify requires a form-name field
      formData.set('form-name', 'contact')
      // Post to current path for Netlify
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      })
      if (response.ok) {
        setStatus('success')
        setName('')
        setEmail('')
        setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <Box id="contact" ref={rootRef} component="section" aria-labelledby="contact-heading" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Typography id="contact-heading" variant="overline" color="text.secondary">
            {data.heading}
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }}>
            <Stack className="contact-col" spacing={2} sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700} sx={{ maxWidth: 700 }}>
                {data.friendlyMessage}
              </Typography>
              <Box aria-live="polite">
                {status === 'success' && (
                  <Alert severity="success" onClose={() => setStatus('idle')} role="status">
                    Thank you for submitting your response!
                  </Alert>
                )}
                {status === 'error' && (
                  <Alert severity="error" onClose={() => setStatus('idle')} role="alert">
                    Something went wrong. Please contact me at{' '}
                    {footerInfo.email ? (
                      <Link href={`mailto:${footerInfo.email}`}>{footerInfo.email}</Link>
                    ) : (
                      'my email.'
                    )}
                  </Alert>
                )}
              </Box>
            </Stack>

            <Box
              className="contact-col"
              component="form"
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={onSubmit}
              sx={{ flex: 1 }}
            >
              {/* Netlify hidden inputs */}
              <input type="hidden" name="form-name" value="contact" />
              <input type="text" name="bot-field" style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
              <Stack spacing={2}>
                <TextField
                  name="name"
                  label={data.form?.nameLabel}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  size='medium'
                  fullWidth
                  required
                />
                <TextField
                  name="email"
                  type="email"
                  label={data.form?.emailLabel}
                  size='medium'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  name="message"
                  label={data.form?.messageLabel}
                  value={message}
                  size='medium'
                  onChange={(e) => setMessage(e.target.value)}
                  fullWidth
                  multiline
                  minRows={4}
                  required
                />
                <Stack direction="row" justifyContent="flex-end">
                  <Button type="submit" variant='outlined' color="primary" fullWidth size="large" aria-label={data.form?.submitText} disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending…' : data.form?.submitText}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
