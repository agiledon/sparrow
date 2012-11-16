package com.sparrowframework.core.event

import com.sparrowframework.core.Message

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 2:59 PM
 */
trait Event extends Message{
  def getHandlers: Set[EventHandler]
  def isTriggered: Boolean
  def trigger
}
