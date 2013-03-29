package com.sparrowframework.core.command

import org.scalatest.FunSuite

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 9:40 AM
 */
class CommandBusTest extends FunSuite {
  test("should dispatch command"){
    val command: CustomerCommand = new CustomerCommand("commandName1")
    CommandBus dispatch command
    Thread.sleep(1000)
    assert(command.isReceived == true)
  }

  test("should dispatch command, then command handler will trigger event via aggregate root") {
    val command = new CustomerCommand("commandName1")
    CommandBus dispatch command
    Thread.sleep(1000)
    assert(command.isReceived == true)
  }

  test("should dispatch wrong command without command handler, does not trigger event") {
    val command = new WrongCommand("commandName1")
    CommandBus dispatch command
    Thread.sleep(1000)
    assert(command.isReceived != true)
  }

}
