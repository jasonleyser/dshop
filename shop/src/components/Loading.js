import React, { useEffect, useState } from 'react'

const Loading = () => {
  const [hidden, setHidden] = useState(true)
  useEffect(() => {
    const to = setTimeout(() => {
      setHidden(false)
    }, 100)
    return function cleanup() {
      clearTimeout(to)
    }
  })
  return hidden ? null : <>Loading...</>
}

export default Loading
