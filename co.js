// async await 对于generater 和 promise的封装使用如下
function* myGenerator() {
  console.log(yield Promise.resolve(1))   //1
  console.log(yield Promise.resolve(2))   //2
  console.log(yield 3)   //3
}

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


// 为了保障doNext可以正常执行，可以把value使用promise.resolve封装成promise
function co2 (gen) {
  const it = gen()
  return new Promise((resolve, reject) => {
    function doNext (lastValue) {
      const {value, done} = it.next(lastValue)
      if (done) {
        resolve(lastValue)
      } else {
        Promise.resolve(value).then(doNext, reject)
      }
    }
    doNext()
  })
}

co2(myGenerator)