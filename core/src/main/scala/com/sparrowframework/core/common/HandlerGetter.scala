package com.sparrowframework.core.common

import java.lang.annotation.{AnnotationFormatError, Annotation}

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/27/12
 * Time: 8:33 PM
 */
trait HandlerGetter {
  def get[T](beAnnotated: Object): Set[T] = {
    var handlers = Set[T]()

    try {
      beAnnotated.getClass.getAnnotation(classOf[TargetHandler]).target.foreach {
        handlers += _.newInstance.asInstanceOf[T]
      }
    } catch {
      case ex: AnnotationFormatError => println("Exception: " + ex.getMessage)
      case _ => println("Exception: Not set right handler.")
    }
    handlers
  }
}
