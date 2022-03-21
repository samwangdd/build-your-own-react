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
  // Step1: create dom node
  // 将这个 DOM node 保存在 fiber.dom 属性中以持续跟踪
  // 创建 DOM
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // 添加
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  // 渲染阶段会被中断，如果处理一个 unit 就挂载，用户将会看到不完整的 UI

  // Step2: create new fibers
  // 将会创建子节点的 fiber
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]
    // fiber 的结构
    const newFiber = {
      dom: null, // dom 指通过 fiber 创建的当前元素对应的 DOM；如果不存在，会通过 createDom 创建
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

  // Step3: return next unit of work（fiber）
  // 如果有 child 节点（上面已赋值）
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  // 将会一直查找
  // FIXME: 怎么实现深度优先遍历？
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    // FIXME: 怎么找父节点的兄弟节点？
    // 会执行 while 遍历，如果 parent 存在 sibling，则会返回
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
  // 将 Fiber Tree 的根节点设置为工作单元
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
