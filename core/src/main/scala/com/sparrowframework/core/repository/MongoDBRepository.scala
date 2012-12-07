package com.sparrowframework.core.repository

import com.sparrowframework.core.domain.AggregateRoot
import com.mongodb.casbah.{MongoConnection, MongoCollection}
import com.mongodb.casbah.commons.MongoDBObject

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 12/7/12
 * Time: 12:08 PM
 */
class MongoDBRepository[T <: AggregateRoot] extends Repository[T] {
  def save(entity: T) {
    val mongoConnection = MongoConnection()
    val mongoCollection = mongoConnection("sparrow_test")("sparrow_data")

    val mongoObject = MongoDBObject(entity.toJsonList)
    mongoCollection += mongoObject

    mongoConnection.close
  }

}
