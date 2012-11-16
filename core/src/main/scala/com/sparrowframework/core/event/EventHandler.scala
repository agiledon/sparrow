package com.sparrowframework.core.event

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 2:58 PM
 */
trait EventHandler {
  def handle(event: Event)
}
