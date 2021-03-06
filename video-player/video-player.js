(() => {

  const DOM = {
    container: document.querySelector('.player-container'),
    controls: document.querySelector('.player-controls'),
    video: document.getElementById('video'),
    progress: document.getElementById('progress'),
    progressFilled: document.getElementById('progressFilled'),
    progressCursor: document.getElementById('progressCursor'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    volume: document.getElementById('volume'),
    togglePlayButton: document.getElementById('togglePlay'),
    toggleMuteButton: document.getElementById('toggleMute'),
    toggleFullscreenButton: document.getElementById('toggleFullscreen'),
  }

  let isPlaying = false
  let isMuted = false
  let isFullScreen = false
  let isDragging = false
  let prevPrettyTime = ''
  let mouseTimer = 0

  function init () {
    initEvents()
  }

  function initEvents () {
    DOM.container.addEventListener('mouseenter', onMouseEnter)
    DOM.container.addEventListener('mouseleave', onMouseLeave)
    DOM.controls.addEventListener('mouseenter', onMouseEnter)
    DOM.video.addEventListener('timeupdate', onTimeupdate)
    DOM.video.addEventListener('loadedmetadata', loadedmetadata)
    DOM.togglePlayButton.addEventListener('click', togglePlay)
    DOM.toggleMuteButton.addEventListener('click', toggleMute)
    DOM.toggleFullscreenButton.addEventListener('click', toggleFullscreen)
    DOM.progress.addEventListener('mousedown', handleTimeupdate)
    DOM.volume.addEventListener('input', updateVolume)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('webkitfullscreenchange', fullscreenChange)
  }

  function loadedmetadata () {
    DOM.totalTime.innerHTML = prettyTime(DOM.video.duration)
  }

  function onPlay () {
    isPlaying = true

    DOM.togglePlayButton.classList.remove('play')
    DOM.togglePlayButton.classList.add('pause')

    DOM.video.play()
  }

  function onPause () {
    isPlaying = false

    DOM.togglePlayButton.classList.remove('pause')
    DOM.togglePlayButton.classList.add('play')

    DOM.video.pause()
  }

  function onMuted () {
    isMuted = true

    DOM.toggleMuteButton.classList.remove('mute')
    DOM.toggleMuteButton.classList.add('unmute')

    DOM.video.muted = isMuted
  }

  function onUnMuted () {
    isMuted = false

    DOM.toggleMuteButton.classList.remove('unmute')
    DOM.toggleMuteButton.classList.add('mute')    

    DOM.video.muted = isMuted
  }

  function updateVolume (event) {
    const volume = event.target.value
    DOM.volume.value = volume
    DOM.video.volume = volume / 100
    DOM.volume.style.backgroundSize = `${(volume * 100) / 100}% 100%`
  }

  function onFullscreen (event) {
    isFullScreen = true

    DOM.toggleFullscreenButton.classList.remove('fullscreen')
    DOM.toggleFullscreenButton.classList.add('unfullscreen')
    
    DOM.container.webkitRequestFullscreen()
    DOM.container.classList.add('is-fullscreen')
  }

  function onUnFullscreen (event) {
    isFullScreen = false

    DOM.toggleFullscreenButton.classList.remove('unfullscreen')
    DOM.toggleFullscreenButton.classList.add('fullscreen')
    
    document.webkitExitFullscreen()
    DOM.container.classList.remove('is-fullscreen')
  }

  function fullscreenChange () {
    if (!document.webkitIsFullScreen) {
      DOM.container.classList.remove('no-cursor')

      onUnFullscreen()
    }
  }  

  function onMouseEnter () {
    DOM.container.classList.remove('transition-out')
    DOM.container.classList.add('transition-in')
  }

  function onMouseLeave () {
    if (isPlaying) {
      DOM.container.classList.remove('transition-in')
      DOM.container.classList.add('transition-out')
    }
  }

  function onMouseMove (event) {
    if (isDragging) {
      handleTimeupdate(event)
    }

    onMouseObservation(event)
  }

  function onMouseUp () {
    isDragging = false

    DOM.progress.classList.remove('is-dragging')    
  }
  
  function onMouseObservation (event) {
    clearTimeout(mouseTimer)

    if (isFullScreen) DOM.container.classList.remove('no-cursor')
    
    if (event.target.closest('.player-controls') === null) {
      mouseTimer = setTimeout(() => {
        onMouseLeave()

        if (isFullScreen) DOM.container.classList.add('no-cursor')
      }, 2 * 1000)
    }
  }

  function togglePlay () {
    if (isPlaying) {
      onPause()
    }
    else {
      onPlay()
    }
  }

  function toggleMute () {
    if (isMuted) {
      onUnMuted()
    }
    else {
      onMuted()
    }
  }

  function toggleFullscreen () {
    if (isFullScreen) {
      onUnFullscreen()
    }
    else {
      onFullscreen()
    }
  }

  function prettyTime (t) {
    const hours = zeroFill(Math.floor(t / 3600))
    const minutes = zeroFill(Math.floor(t % 3600 / 60))
    const second = zeroFill(Math.floor(t % 3600 % 60))

    return `${hours}:${minutes}:${second}`
  }

  function updateProgressFilled () {
    DOM.progressFilled.style.transform = `scaleX(${DOM.video.currentTime / DOM.video.duration})`
  }

  function updateProgressCursor () {
    DOM.progressCursor.style.left = `${DOM.video.currentTime / DOM.video.duration * 100}%`
  }

  function updateTimeDisplay () {
    const currentPrettyTime = prettyTime(DOM.video.currentTime)
    
    if (prevPrettyTime !== currentPrettyTime) {
      DOM.currentTime.innerHTML = currentPrettyTime
    }
    prevPrettyTime = currentPrettyTime
  }

  function onTimeupdate () {
    updateTimeDisplay()
    updateProgressFilled()
    updateProgressCursor()
  }

  function handleTimeupdate (event) {
    event.stopPropagation()

    isDragging = true

    const rect = DOM.progress.getBoundingClientRect()
    DOM.video.currentTime = Math.min(Math.max((event.clientX - rect.left) / rect.width * DOM.video.duration, 0), DOM.video.duration)

    onTimeupdate()

    if (!DOM.progress.classList.contains('is-dragging')) DOM.progress.classList.add('is-dragging')
  }

  function zeroFill (n) {
    return ('0' + n).slice(-2)
  }

  init()

})()
