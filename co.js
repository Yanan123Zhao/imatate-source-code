module.exports = function co1 (gen) {
  const it = gen()
  return new Promise((resolve, reject) => {
    const next = it.next()
    function doit (next) {
      if (!next.done) {
        if (next.value instanceof Promise) {
          next.value.then((v) => {
            const nextValue = it.next(v)
            doit(nextValue)
          })
        } else {
          const nextValue = it.next(next.value)
          doit(nextValue)
        }
      } else {
        resolve(next.value)
      }
    }
    doit(next)
  })
}


function co2 (gen) {
  const it = gen()
  return new Promise((resolve, reject) => {
    function doNext (lastValue) {
      const {value, done} = it.next(lastValue)
      if (done) {
        resolve(lastValue)
      } else {
        value.then(doNext, reject)
      }
    }
    doNext()
  })
}
