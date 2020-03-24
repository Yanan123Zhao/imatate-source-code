// 低配的generater
const context = {
  prev: 0,
  next: 0,
  done: false,
  stop: function stop () {
    this.done = true
  }
}

function gen$ (_context) {
  while (1) {
    switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2
        return 'result1'
      case 2:
        _context.next = 'end'
        return 'result2'
      case "end":
        return _context.stop();
    }
  }
}

function gen () {
  return {
    next: (injectValue) => {   
      const value = context.done ? void 0 : gen$(context)
      const done = context.done
      return {
        value,
        done
      }
    }
  }
}

const g = gen()
console.log(g.next())
console.log(g.next())
console.log(g.next())
