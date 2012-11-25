package com.sparrowframework.core.domain

import com.sparrowframework.core.event.{CustomEventHandler, CustomEvent, EventBus}
import com.sparrowframework.core.event.interceptor.LoggingInterceptor
import com.sparrowframework.core.command.CustomCommand
import java.util.UUID

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/25/12
 * Time: 5:36 PM
 */
class Custom extends AggregateRoot {
  val id = UUID.randomUUID()
  def save(command: CustomCommand) {
    val event = new CustomEvent("custom event")
    val eventHandler = new CustomEventHandler with LoggingInterceptor
    event publish eventHandler
    EventBus send event
  }


}
