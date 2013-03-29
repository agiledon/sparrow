package com.sparrowframework.core.event

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/30/12
 * Time: 8:41 PM
 */
class SuccessfulEventHandler extends EventHandler{
  def handle(event: Event) {
    println("handle event, set successful status")
    event.trigger
  }
}
