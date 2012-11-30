package com.sparrowframework.core.domain

import com.sparrowframework.core.event.CustomEvent
import com.sparrowframework.core.command.Command

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
