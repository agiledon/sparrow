package com.sparrowframework.core.common

import com.sparrowframework.core.command.CommandHandler

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/27/12
 * Time: 8:33 PM
 */
trait HandlerGetter {
  def get(target: Object): Set[CommandHandler] = {
    var handlers = Set[CommandHandler]()

    target.getClass.getAnnotations filter {
      a =>
        a.annotationType == classOf[TargetHandler]
    } foreach {
      a =>
        handlers += a.asInstanceOf[TargetHandler].target.newInstance.asInstanceOf[CommandHandler]
    }
    handlers
  }
}
