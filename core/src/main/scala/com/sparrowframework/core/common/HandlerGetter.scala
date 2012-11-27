package com.sparrowframework.core.common

import com.sparrowframework.core.command.CommandHandler

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/27/12
 * Time: 8:33 PM
 */
trait HandlerGetter {
  def get[T](target: Object): Set[T] = {
    var handlers = Set[T]()

    try {
    target.getClass.getAnnotations filter {
      a =>
        a.annotationType == classOf[TargetHandler]
    } foreach {
      a =>
        handlers += a.asInstanceOf[TargetHandler].target.newInstance.asInstanceOf[T]
    }
    }catch {
      case ex:RuntimeException => println("Not set right handler." + ex.getMessage)
      case _ => println("Not set right handler.")
    }
    handlers
  }

}
