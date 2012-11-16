package com.sparrowframework.core.event

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 2:59 PM
 */
trait Event {
  def getName(): String
  def getHandlers(): Set[EventHandler]
  def isTriggered(): Boolean
  def trigger()
}
