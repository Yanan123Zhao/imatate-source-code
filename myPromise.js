const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function MyPromise (excutor) {
  let that = this
  this.status = PENDING
  this.value = null
  this.reason = null
  this.onFulfilledCallbacks = []
  this.onRejectedCallbacks = []
  function resolve (value) {
    // 此处setTimeout是关键
    // 1. resolve永远在then后执行
    setTimeout(() => {
      if (that.status === PENDING) {
        that.status = FULFILLED
        that.value = value
        that.onFulfilledCallbacks.forEach(cb => cb(value));
      }
    })
  }
  function reject (reason) {
    setTimeout(() => {
      if (that.status === PENDING) {
        that.status = REJECTED
        that.reason = reason
        that.onRejectedCallbacks.forEach(cb => cb(reason));
      }
    });
  }
  try {
    excutor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

function resolvePromise (promise2, x, resolve, reject) {
  if (x === promise2) {
    reject('循环引用')
  }
  // let called = false
  // 如果是promise
  if (x instanceof MyPromise) {
    if (x.status === PENDING) {
      x.then((y) => {
        resolvePromise(promise2, y, resolve, reject)
      }, reject)
    } else {
      x.then(resolve, reject)
    }
    // 如果x是thaneble对象或者函数
  } else if (x !== null && (typeof x === 'function' || typeof x === 'object')) {
    try {
      const then = x.then
      if (typeof x === 'function') {
        resolve(x())
      } else (typeof then === 'function') {
        then.call(x, (y) => {
          resolvePromise(promise2, y, resolve, reject)
        }, reject)
      } else {
        resolve(x)
      } 
    } catch (reason) {
      reject(reason)
    }
    // 如果是普通值
  } else {
    resolve(x)
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val =>  val
  onRejected = typeof onRejected === 'function' ? onRejected : reason =>  {
    throw reason
  }
  let promise2 = null
  const that = this
  if (this.status === PENDING) {
    promise2 = new MyPromise(function (thenResolve, thenReject) {
      that.onFulfilledCallbacks.push(function (...args) {
        try {
          let x = onFulfilled(...args)
          resolvePromise(promise2, x, thenResolve, thenReject)
        } catch (e) {
          thenReject(e)
        }
      })
      that.onRejectedCallbacks.push(function (...args) {
        try {
          let x = onRejected(...args)
          resolvePromise(promise2, x, thenResolve, thenReject)
        } catch (reason) {
          thenReject(reason)
        }
      })
      
    }) 
  } else if (this.status === FULFILLED) {
    // 当then里return p.then的时候，此时P的状态已经是fullfiled
      promise2 = new Promise(function (thenResolve, thenReject) {
        try {
          let x = onFulfilled(that.value)
          resolvePromise(promise2, x, thenResolve, thenReject)
        } catch (e) {
          thenReject(e)
        }
      })
  } else {
    // 当then里return p.then的时候，此时P的状态已经是reject
      promise2 = new Promise(function (thenResolve, thenReject) {
        try {
          let x = onRejected(that.value)
          resolvePromise(promise2, x, thenResolve, thenReject)
        } catch (e) {
          thenReject(e)
        }
      })
  }
  return promise2
}

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}

MyPromise.prototype.resolve = function (value) {
  return new MyPromise(resolve => {
    resolve(value)
  }))
}

MyPromise.prototype.reject = function (value) {
  return new MyPromise((resolve, reject) => {
    reject(value)
  }))
}


function allDone (length, resolve) {
  let count = 0
  const result = []
  return function (index, value) {
    result[index] = value
    count++ 
    if (count === length) {
      resolve(result)
    }
  }
}
// Promise.all
MyPromise.all = function (promises) {
  return new MyPromise((resolve, reject) => {
    const gen = allDone(promises.length, resolve)
    promises.forEach((p, index) => {
      p.then((v) => {
        gen(index, v)
      }, reject)
    })
  })
}
// Promise.race
MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    promises.forEach((p, index) => {
      p.then(resolve, reject)
    })
  })
}

