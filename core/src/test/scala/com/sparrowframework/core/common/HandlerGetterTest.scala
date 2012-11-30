package com.sparrowframework.core.common

import org.scalatest.FunSuite
import com.sparrowframework.core.command.{CommandHandler, CustomCommandHandler, CustomCommand}
import com.sparrowframework.core.event.{CreateOrderEvent, CompletedEventHandler, EventHandler, CustomEvent}

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/27/12
 * Time: 8:47 PM
 */
class HandlerGetterTest extends FunSuite {
  test("should get annotated command handler") {
    val getter = new FakeHandlerGetter
    val command = new CustomCommand("name")
    val handlers: Set[CommandHandler] = getter.get[CommandHandler](command)
    assert(handlers.size == 1)
    handlers.foreach { handler =>
      assert(handler.isInstanceOf[CustomCommandHandler] == true)
    }
  }

  test("should get annotated event handler") {
    val getter = new FakeHandlerGetter
    val event = new CustomEvent("name")
    val handlers: Set[EventHandler] = getter.get[EventHandler](event)
    assert(handlers.size == 1)
    handlers.foreach { handler =>
      assert(handler.isInstanceOf[CompletedEventHandler] == true)
    }
  }

//  test("should get two annotated event handlers") {
//    val getter = new FakeHandlerGetter
//    val event = new CreateOrderEvent("name")
//    val handlers: Set[EventHandler] = getter.get[EventHandler](event)
//    assert(handlers.size == 2)
//    handlers.foreach { handler =>
//      assert(handler.isInstanceOf[EventHandler] == true)
//    }
//  }
}

class FakeHandlerGetter extends HandlerGetter


