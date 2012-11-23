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
    val command: CustomCommand = new CustomCommand("commandName1")
    CommandBus send command
    Thread.sleep(1000)
    assert(command.isReceived == true)
  }

  test("send command via actor twice"){
    val command1: CustomCommand = new CustomCommand("commandName1")
    val command2: CustomCommand = new CustomCommand("commandName2")
    CommandBus send command1
    CommandBus send command2
    Thread.sleep(1000)
    assert(command1.isReceived == true)
    assert(command2.isReceived == true)
  }

}
