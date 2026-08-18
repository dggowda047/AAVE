/* =========================================================
   SignaLink — Plain JS interactions (no build step)
   ========================================================= */

const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- Loader ---------- */
window.addEventListener('load', () => {
  const loader = $('#loader')
  if (!loader) return
  setTimeout(() => loader.classList.add('is-hidden'), 500)
})

/* ---------- Year ---------- */
const yearEl = $('#year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

/* ---------- Navigation ---------- */
const nav = $('#nav')
const navToggle = $('#navToggle')
const navLinks = $('#navLinks')

const onScrollNav = () => {
  if (window.scrollY > 30) nav.classList.add('is-scrolled')
  else nav.classList.remove('is-scrolled')
}
onScrollNav()
window.addEventListener('scroll', onScrollNav, { passive: true })

const closeMenu = () => {
  navLinks.classList.remove('is-open')
  navToggle.classList.remove('is-open')
  navToggle.setAttribute('aria-expanded', 'false')
  document.body.classList.remove('no-scroll')
}
const toggleMenu = () => {
  const open = navLinks.classList.toggle('is-open')
  navToggle.classList.toggle('is-open', open)
  navToggle.setAttribute('aria-expanded', String(open))
  document.body.classList.toggle('no-scroll', open)
}
navToggle.addEventListener('click', toggleMenu)
$$('#navLinks a').forEach((a) => a.addEventListener('click', closeMenu))
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu()
})

/* ---------- Smooth scroll for in-page anchors ---------- */
$$('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href')
    if (id === '#' || id.length < 2) return
    const target = document.querySelector(id)
    if (!target) return
    e.preventDefault()
    const top = target.getBoundingClientRect().top + window.scrollY - 60
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })
  })
})

/* ---------- Reveal on scroll ---------- */
const revealEls = $$('.reveal')
if ('IntersectionObserver' in window && !prefersReduced) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target
          const delay = parseInt(el.dataset.delay || '0', 10)
          setTimeout(() => el.classList.add('is-visible'), delay)
          io.unobserve(el)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  )
  revealEls.forEach((el) => io.observe(el))
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'))
}

/* ---------- Timeline line animation ---------- */
const timeline = $('.timeline')
if (timeline && 'IntersectionObserver' in window) {
  const tio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          timeline.classList.add('is-animated')
          tio.unobserve(timeline)
        }
      })
    },
    { threshold: 0.15 }
  )
  tio.observe(timeline)
}

/* ---------- Animated counters ---------- */
const counters = $$('[data-count]')
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count)
  const suffix = el.dataset.suffix || ''
  const duration = 1800
  const start = performance.now()
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    const val = Math.floor(eased * target)
    el.textContent = val + suffix
    if (p < 1) requestAnimationFrame(step)
    else el.textContent = target + suffix
  }
  requestAnimationFrame(step)
}
if ('IntersectionObserver' in window && !prefersReduced) {
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target)
          cio.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.5 }
  )
  counters.forEach((c) => cio.observe(c))
} else {
  counters.forEach((c) => {
    c.textContent = c.dataset.count + (c.dataset.suffix || '')
  })
}

/* ---------- Parallax ---------- */
if (!prefersReduced) {
  const heroVideo = $('.hero__video')
  const heroContent = $('.hero__content')
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY
      if (y < window.innerHeight && heroVideo) {
        heroVideo.style.transform = `translateY(${y * 0.35}px) scale(1.05)`
        if (heroContent) heroContent.style.transform = `translateY(${y * 0.18}px)`
        heroContent.style.opacity = String(Math.max(1 - y / 600, 0))
      }
    },
    { passive: true }
  )
}

/* ---------- Mouse glow ---------- */
const mouseGlow = $('#mouseGlow')
if (mouseGlow && window.matchMedia('(hover: hover)').matches) {
  let raf = 0
  let mx = 0
  let my = 0
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX
    my = e.clientY
    if (!raf) {
      raf = requestAnimationFrame(() => {
        mouseGlow.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
        raf = 0
      })
    }
  })
}

/* ---------- Ripple effect ---------- */
$$('.ripple').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const span = document.createElement('span')
    span.className = 'ripple-effect'
    span.style.width = span.style.height = `${size}px`
    span.style.left = `${x}px`
    span.style.top = `${y}px`
    btn.appendChild(span)
    setTimeout(() => span.remove(), 700)
  })
})

/* ---------- FAQ accordion ---------- */
$$('.faq__item').forEach((item) => {
  const q = $('.faq__q', item)
  const a = $('.faq__a', item)
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open')
    $$('.faq__item').forEach((other) => {
      other.classList.remove('is-open')
      other.querySelector('.faq__q').setAttribute('aria-expanded', 'false')
      other.querySelector('.faq__a').style.maxHeight = null
    })
    if (!isOpen) {
      item.classList.add('is-open')
      q.setAttribute('aria-expanded', 'true')
      a.style.maxHeight = a.scrollHeight + 'px'
    }
  })
})

/* ---------- Floating CTA visibility ---------- */
const floatCta = $('.float-cta')
if (floatCta) {
  const onScrollCta = () => {
    if (window.scrollY > 600) floatCta.classList.add('is-visible')
    else floatCta.classList.remove('is-visible')
  }
  onScrollCta()
  window.addEventListener('scroll', onScrollCta, { passive: true })
}

/* ---------- Particle background ---------- */
const canvas = $('#particles')
if (canvas && !prefersReduced) {
  const ctx = canvas.getContext('2d')
  let particles = []
  let w = 0
  let h = 0
  const COLORS = ['#00d4ff', '#4adede', '#8a2be2']
  const COUNT = window.innerWidth < 760 ? 28 : 60

  const resize = () => {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const makeParticle = () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 0.6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.5 + 0.2,
  })
  for (let i = 0; i < COUNT; i++) particles.push(makeParticle())

  let running = true
  const draw = () => {
    if (!running) return
    ctx.clearRect(0, 0, w, h)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > w) p.vx *= -1
      if (p.y < 0 || p.y > h) p.vy *= -1
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.alpha
      ctx.fill()
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j]
        const dx = p.x - q.x
        const dy = p.y - q.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          ctx.strokeStyle = p.color
          ctx.globalAlpha = (1 - dist / 120) * 0.15
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }
    }
    ctx.globalAlpha = 1
    requestAnimationFrame(draw)
  }
  draw()

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden
    if (running) draw()
  })
}

/* ---------- Form validation + PHP submission ---------- */
const form = $('#enrollForm')
if (form) {
  const note = $('#formNote')
  const submitBtn = $('#submitBtn')
  const btnLabel = $('.btn__label', submitBtn)

  const validators = {
    company: (v) => (v.trim() ? '' : 'Company name is required'),
    owner: (v) => (v.trim() ? '' : 'Owner name is required'),
    phone: (v) => (/^[+]?[\d\s\-()]{8,15}$/.test(v.trim()) ? '' : 'Enter a valid phone number'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email'),
    location: (v) => (v.trim() ? '' : 'Billboard location is required'),
    maps: (v) => {
      if (!v.trim()) return ''
      return /^https?:\/\/.+/.test(v.trim()) ? '' : 'Enter a valid URL'
    },
    size: (v) => (v.trim() ? '' : 'Screen size is required'),
    resolution: (v) => (v.trim() ? '' : 'Resolution is required'),
    type: (v) => (v ? '' : 'Select a billboard type'),
    screens: (v) => (parseInt(v, 10) >= 1 ? '' : 'Enter at least 1 screen'),
    hours: (v) => (v.trim() ? '' : 'Operating hours is required'),
    connectivity: (v) => (v ? '' : 'Select connectivity type'),
    availability: (v) => (v ? '' : 'Select availability'),
    plan: (v) => (v ? '' : 'Select a service plan'),
  }

  const validateField = (input) => {
    const name = input.name
    const validator = validators[name]
    if (!validator) return true
    const msg = validator(input.value)
    const field = input.closest('.field')
    const errEl = $(`.field__error[data-for="${name}"]`, field)
    if (msg) {
      field.classList.add('is-invalid')
      if (errEl) errEl.textContent = msg
      return false
    }
    field.classList.remove('is-invalid')
    if (errEl) errEl.textContent = ''
    return true
  }

  $$('#enrollForm input, #enrollForm select, #enrollForm textarea').forEach((input) => {
    input.addEventListener('blur', () => validateField(input))
    input.addEventListener('input', () => {
      const field = input.closest('.field')
      if (field.classList.contains('is-invalid')) validateField(input)
    })
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    let valid = true
    $$('#enrollForm input, #enrollForm select, #enrollForm textarea').forEach((input) => {
      if (validators[input.name] && !validateField(input)) valid = false
    })

    if (!valid) {
      note.textContent = 'Please fix the highlighted fields and try again.'
      note.className = 'form-note is-error'
      const firstInvalid = $('.field.is-invalid')
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const formData = new FormData(form)
    submitBtn.disabled = true
    btnLabel.textContent = 'Submitting...'
    note.textContent = ''
    note.className = 'form-note'

    try {
      const res = await fetch('send.php', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        form.reset()
        $$('#enrollForm .field').forEach((f) => f.classList.remove('is-invalid'))
        note.textContent =
          'Registration received. Our onboarding team will contact you shortly to verify the details.'
        note.className = 'form-note is-success'
      } else {
        note.textContent = data.message || 'Something went wrong. Please try again.'
        note.className = 'form-note is-error'
      }
    } catch (err) {
      note.textContent = 'Could not submit. Please check your connection and try again.'
      note.className = 'form-note is-error'
    } finally {
      submitBtn.disabled = false
      btnLabel.textContent = 'Submit Registration'
    }
  })
}

/* ---------- Newsletter ---------- */
const newsForm = $('#newsletterForm')
if (newsForm) {
  const msg = $('#newsMsg')
  newsForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const email = $('#newsEmail').value.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = 'Please enter a valid email.'
      msg.style.color = '#ff7a8a'
      return
    }
    msg.textContent = "You're subscribed. Welcome aboard!"
    msg.style.color = 'var(--cyan)'
    newsForm.reset()
  })
}
