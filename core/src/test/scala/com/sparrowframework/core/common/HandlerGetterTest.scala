package com.sparrowframework.core.common

import org.scalatest.FunSuite
import com.sparrowframework.core.command.{CommandHandler, CustomCommandHandler, CustomCommand}

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/27/12
 * Time: 8:47 PM
 */
class HandlerGetterTest extends FunSuite {
  test("should get instance with annotation") {
    val getter = new FakeHandlerGetter
    val command = new CustomCommand("name")
    val handlers: Set[CommandHandler] = getter.get[CommandHandler](command)
    assert(handlers.size == 1)
    handlers.foreach { handler =>
      assert(handler.isInstanceOf[CustomCommandHandler] == true)
    }
  }
}

class FakeHandlerGetter extends HandlerGetter


