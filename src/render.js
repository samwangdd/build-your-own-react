import {TEXT_TYPE} from './createElement';

export function render(element,container) {
  // 创建 DOM 节点
  const dom = element.type === TEXT_TYPE ? document.createTextNode("") : document.createElement(element.type);
  const isProperty = key => key !== "children";

  // 将 props 赋值给 DOM 节点
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name];
    });

  // 递归 children
  // element.props.children.forEach(child => render(child, dom))
  let nextUnitWork = null;
  
  function workLoop(deadline){
    let shouldYield = false;
    while(nextUnitWork && !shouldYield){
      nextUnitWork = performUnitOfWork(nextUnitWork);
      shouldYield = deadline.timeRemaining() < 1;
    }
    
    requestIdleCallback(workLoop); // 循环调用
  }

  requestIdleCallback(workLoop);

  function performUnitOfWork(nestUnitOfWork){
    if(nestUnitOfWork.isComplete){
      return nestUnitOfWork.sibling;
    }
  }
  
  // 将新节点添加到 container
  container.appendChild(dom);
}