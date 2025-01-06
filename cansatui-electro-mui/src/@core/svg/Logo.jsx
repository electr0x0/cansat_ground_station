const Logo = props => {
  return (
    <svg width='1.4583em' height='1em' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      {/* Satellite Body */}
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 4C10.34 4 9 5.34 9 7C9 8.66 10.34 10 12 10C13.66 10 15 8.66 15 7C15 5.34 13.66 4 12 4Z'
        fill='currentColor'
      />

      {/* Solar Panels */}
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M4 7H8V8H4V7ZM16 7H20V8H16V7Z'
        fill='currentColor'
      />

      {/* Antenna */}
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 2L13 3V6H11V3L12 2Z'
        fill='currentColor'
      />

      {/* Signal Waves */}
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M8.4 11.4C9.4 12.4 10.6 13 12 13C13.4 13 14.6 12.4 15.6 11.4L16.7 12.5C15.5 13.7 13.8 14.5 12 14.5C10.2 14.5 8.5 13.7 7.3 12.5L8.4 11.4Z'
        fill='currentColor'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.9 8.9C7.5 10.5 9.6 11.5 12 11.5C14.4 11.5 16.5 10.5 18.1 8.9L19.2 10C17.4 11.8 14.8 13 12 13C9.2 13 6.6 11.8 4.8 10L5.9 8.9Z'
        fill='currentColor'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M3.4 6.4C5.6 8.6 8.6 10 12 10C15.4 10 18.4 8.6 20.6 6.4L21.7 7.5C19.3 9.9 15.9 11.5 12 11.5C8.1 11.5 4.7 9.9 2.3 7.5L3.4 6.4Z'
        fill='currentColor'
      />

      {/* Earth Curve (Optional) */}
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2 19C2 17.9 10.8 17 12 17C13.2 17 22 17.9 22 19C22 20.1 13.2 21 12 21C10.8 21 2 20.1 2 19Z'
        fill='currentColor'
        opacity='0.3'
      />
    </svg>
  )
}

export default Logo
