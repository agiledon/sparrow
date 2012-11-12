name := "sparrow"

version := "0.1"

scalaVersion := "2.9.2"

libraryDependencies += "org.scalatest" % "scalatest_2.9.1" % "1.8"

libraryDependencies ++= Seq(
    "org.specs2" %% "specs2" % "1.12.2" % "test"
)

libraryDependencies += "junit" % "junit" % "4.10"

resolvers ++= Seq("snapshots" at "http://oss.sonatype.org/content/repositories/snapshots",
                    "releases"  at "http://oss.sonatype.org/content/repositories/releases")