import { TEXT_TYPE } from "./createElement"

// 创建 DOM 节点
function createDom(fiber) {
  const dom =
    fiber.type === TEXT_TYPE
      ? document.createTextNode("")
      : document.createElement(fiber.type)
  const isProperty = (key) => key !== "children"

  // 将 props 赋值给 DOM 节点
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name]
    })

  return dom
}

function performUnitOfWork(fiber) {
  // TODO: add dom node
  // 将这个 DOM node 保存在 fiber.dom 属性中以持续跟踪
  // 创建
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // 添加
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  // 渲染阶段会被中断，如果处理一个 unit 就挂载，用户将会看到不完整的 UI

  // TODO: create new fibers
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]
    // fiber 的结构
    const newFiber = {
      dom: null, // FIXME: dom 表示什么？
      props: element.props,
      type: element.type,
      parent: fiber,
    }

    // 如果 index 为 0，则为 child；
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    // 将当前节点储存为 prevSibling；下一次循环，sibling (兄弟节点) 指向新 fiber
    prevSibling = newFiber
    index++
  }

  // TODO: return next unit of work（fiber）
  // 如果有 child 节点（上面已赋值）
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent // 如果是 Root 节点，nextFiber 为 undefined
  }
}

let nextUnitOfWork = null
let wipRoot = null

function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) return
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

export function render(element, container) {
  // 将工作单元设置为 Fiber Tree 的根节点
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  }

  nextUnitOfWork = wipRoot
}

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop) // 循环调用
}

requestIdleCallback(workLoop)
