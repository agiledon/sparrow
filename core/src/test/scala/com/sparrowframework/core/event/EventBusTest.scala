package com.sparrowframework.core.event

import org.scalatest.FunSuite
import com.sparrowframework.core.command.{CommandBus, CustomCommand}

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 3:16 PM
 */
class EventBusTest extends FunSuite {
  test("send event via actor once"){
    val message: Event = new CustomEvent("eventName1")
    message.publish(new CustomEventHandler)
    EventBus.send(message)
    Thread.sleep(1000)
    assert(message.isTriggered == true)
  }
}
