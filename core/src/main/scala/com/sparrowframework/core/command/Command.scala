package com.sparrowframework.core.command

import com.sparrowframework.core.Message

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 10:02 AM
 */
class Command(val commandName: String) extends Message {
  private var isReceivedFlag = false

  def isReceived() = isReceivedFlag

  def receive() {
    isReceivedFlag = true
  }
}
