package com.sparrowframework.core.repository

import com.sparrowframework.core.domain.AggregateRoot

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/21/12
 * Time: 1:56 PM
 */
abstract class Repository[T <: AggregateRoot] {
  def save(entity: T)
}
