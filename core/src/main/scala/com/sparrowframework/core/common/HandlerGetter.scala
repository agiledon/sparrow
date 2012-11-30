package com.sparrowframework.core.common

import java.lang.annotation.{AnnotationFormatError, Annotation}

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
      case ex:AnnotationFormatError => println("Exception: " + ex.getMessage)
      case _ => println("Exception: Not set right handler.")
    }
    handlers
  }

  def createHandler[T](a: Annotation) = {
    println("**** handler: " + a.asInstanceOf[TargetHandler].target().getCanonicalName)
    a.asInstanceOf[TargetHandler].target.newInstance.asInstanceOf[T]
  }
}
