/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:30 PM
 */

package com.sparrowframework.core.command

import com.sparrowframework.core.{MessageBus}

object CommandBus extends MessageBus {
  def dispatch(message: Command) {
    send(message)
  }


}

