package com.sparrowframework.core.common

import java.lang.annotation.Annotation

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
      a => a.annotationType == classOf[TargetHandler]
    } foreach {
      a => handlers += createHandler(a)
    }
    }catch {
      case ex:RuntimeException => println("Not set right handler." + ex.getMessage)
      case _ => println("Not set right handler.")
    }
    handlers
  }

  def createHandler[T](a: Annotation) = {
    a.asInstanceOf[TargetHandler].target.newInstance.asInstanceOf[T]
  }
}
