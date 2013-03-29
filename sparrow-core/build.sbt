name := "sparrow"

version := "0.1"

scalaVersion := "2.9.2"

libraryDependencies ++= Seq(
    "junit" % "junit" % "4.10",
    "org.scalatest" % "scalatest_2.9.2" % "1.8",
    "org.specs2" %% "specs2" % "1.12.2" % "test",
    "org.mongodb" % "casbah_2.9.2" % "2.4.1" )

resolvers ++= Seq("snapshots" at "http://oss.sonatype.org/content/repositories/snapshots",
                    "releases"  at "http://oss.sonatype.org/content/repositories/releases")