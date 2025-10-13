import * as React from "react"

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof BREAKPOINTS>('desktop')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.mobile) {
        setBreakpoint('mobile')
      } else if (width < BREAKPOINTS.tablet) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

export function useIsMobile() {
  const breakpoint = useBreakpoint()
  return breakpoint === 'mobile'
}

export function useIsTablet() {
  const breakpoint = useBreakpoint()
  return breakpoint === 'tablet'
}

export function useIsDesktop() {
  const breakpoint = useBreakpoint()
  return breakpoint === 'desktop'
}

export function useIsMobileOrTablet() {
  const breakpoint = useBreakpoint()
  return breakpoint === 'mobile' || breakpoint === 'tablet'
}
