package com.sparrowframework.core.event

import com.sparrowframework.core.Message

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 2:59 PM
 */
class Event(val eventName: String) extends Message{
  private var isTriggeredFlag = false

  def isTriggered = isTriggeredFlag

  def trigger {
    isTriggeredFlag = true
  }
}
