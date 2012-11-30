package com.sparrowframework.core.domain

import com.sparrowframework.core.event.{Event, CustomEventHandler, CustomEvent, EventBus}
import com.sparrowframework.core.event.interceptor.LoggingInterceptor
import com.sparrowframework.core.command.{Command, CustomCommand}
import java.util.UUID

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/25/12
 * Time: 5:36 PM
 */
class Custom extends AggregateRoot {
  addEvent { void =>
    new CustomEvent("event name")
  }

  override protected def saveCommand(command: Command) {}
}
