package com.sparrowframework.core.repository

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/21/12
 * Time: 1:56 PM
 */
abstract class Repository[T] {
  def save(entity: T)
}
