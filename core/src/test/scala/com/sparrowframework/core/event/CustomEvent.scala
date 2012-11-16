package com.sparrowframework.core.event

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 3:18 PM
 */
class CustomEvent(name: String) extends Event{
  var subscribers = Set[EventHandler]()

  var isTriggeredFlag: Boolean = false

  def getName = name

  def publish(eventHandler: EventHandler) {
    subscribers += eventHandler
  }

  def getHandlers = {
      Set(new CustomEventHandler)
  }

  def isTriggered = isTriggeredFlag

  def trigger {
    isTriggeredFlag = true
  }
}
