#!/usr/bin/ruby

output = `wget http://speedtest-mel.cdn.on.net/speedtest/random1000x1000.jpg -O /dev/null 2>&1 | grep '[KM]B/s)'`

speed = output.sub(/.+\((.+)\/s.+/, '\1').split(" ")

bits = speed[0].to_f * 8
unit = speed[1]

case unit
when 'KB'
	bits *= 1024
when 'MB'
	bits *= 1024 * 1024
end

mbits = bits / 1024 / 1024

time = Time.now.to_i

puts "#{time} #{mbits}"

File.open(File.dirname(__FILE__) + "/speed.txt", 'a') {|f| f.write("#{time} #{mbits}\n") }
