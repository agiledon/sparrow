package com.sparrowframework.core.command

import org.scalatest.FunSuite

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 9:40 AM
 */
class CommandBusTest extends FunSuite {
  test("send command via actor once"){
    val message: CustomCommand = new CustomCommand("commandName1")
    CommandBus.send(message)
    Thread.sleep(1000)
    assert(message.isReceived() == true)
  }

  test("send command via actor twice"){
    val message1: CustomCommand = new CustomCommand("commandName1")
    val message2: CustomCommand = new CustomCommand("commandName2")
    CommandBus.send(message1)
    CommandBus.send(message2)
    Thread.sleep(1000)
    assert(message1.isReceived() == true)
    assert(message2.isReceived() == true)
  }

}
