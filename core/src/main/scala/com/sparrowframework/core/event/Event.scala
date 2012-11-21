package com.sparrowframework.core.event

import com.sparrowframework.core.Message
import com.sparrowframework.core.event.Event

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 2:59 PM
 */
class Event(name: String) extends Message{
  var subscribers = Set[EventHandler]()

  var isTriggeredFlag: Boolean = false

  def getName = name

  def publish(eventHandler: EventHandler) {
    subscribers += eventHandler
  }

  def getHandlers = {
    subscribers
  }

  def isTriggered = isTriggeredFlag

  def trigger {
    isTriggeredFlag = true
  }
}
