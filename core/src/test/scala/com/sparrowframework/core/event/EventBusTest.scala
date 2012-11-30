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
  test("should publish event") {
    val event: Event = new CustomEvent("eventName1")
    EventBus publish event
    Thread.sleep(1000)
    assert(event.isTriggered == true)
  }
}
