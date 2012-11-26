package com.sparrowframework.core.event

import interceptor.LoggingInterceptor
import org.scalatest.FunSuite
import com.sparrowframework.core.command.{CommandBus, CustomCommand}

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 3:16 PM
 */
class EventBusTest extends FunSuite {
  test("publish event via actor once") {
    val event: Event = new CustomEvent("eventName1")
    event publish new CustomEventHandler
    EventBus publish event
    Thread.sleep(1000)
    assert(event.isTriggered == true)
  }

  test("handle event with logging") {
    val event: Event = new CustomEvent("eventName1")
    val handler = new CustomEventHandler with LoggingInterceptor
    event publish handler
    EventBus publish event
    Thread.sleep(1000)
    assert(event.isTriggered == true)
  }
}
