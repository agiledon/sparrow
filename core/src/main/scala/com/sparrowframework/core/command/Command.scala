package com.sparrowframework.core.command

import com.sparrowframework.core.Message

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 10:02 AM
 */
trait Command extends Message{
  def isReceived: Boolean
  def receive
}
