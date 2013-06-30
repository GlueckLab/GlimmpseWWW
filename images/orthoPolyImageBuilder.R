#
# Create icons for orthogonal polynomials
#

library(Cairo)

# draw brace
CurlyBraces <- function(x, y, range, pos = 1, direction = 1 ) {

    a=c(1,2,3,48,50)    # set flexion point for spline
    b=c(0,.2,.28,.7,.8) # set depth for spline flexion point

    curve = spline(a, b, n = 50, method = "natural")$y / 2 

    curve = c(curve,rev(curve))

    a_sequence = rep(x,100)
    b_sequence = seq(y-range/2,y+range/2,length=100)  

    # direction
    if(direction==1)
    a_sequence = a_sequence+curve
    if(direction==2)
    a_sequence = a_sequence-curve

    # pos
    if(pos==1)
    lines(a_sequence,b_sequence) # vertical
    if(pos==2)
    lines(b_sequence,a_sequence) # horizontal

}


# linear trend
x = c(-1,1)
y = poly(x)
CairoPNG(file="linear.png",width=64, height=64)
par(mar=c(0.1,0.1,0.1,0.1))
plot(x,y,"l",xlab="",ylab="",yaxt="n",xaxt="n")
dev.off()

# quadratic
x = seq(-1,1,0.01)
y = poly(x,degree=2)
CairoPNG("quadratic.png",width=64, height=64)
par(mar=c(0.1,0.1,0.1,0.1))
plot(x,y[,2],"l",xlab="",ylab="",yaxt="n",xaxt="n")
dev.off()

# cubic
x = seq(-1,1,0.01)
y = poly(x,degree=3)
CairoPNG("cubic.png",width=64, height=64)
par(mar=c(0.1,0.1,0.1,0.1))
plot(x,y[,3],"l",xlab="",ylab="",yaxt="n",xaxt="n")
dev.off()

# all trends through cubic
x = seq(-1,1,0.01)
y = poly(x,degree=3)
CairoPNG("allTrends.png",width=64, height=64)
par(mar=c(0.1,0.1,0.1,0.1))
plot(x,y[,3],"l",xlab="",ylab="",yaxt="n",xaxt="n")
lines(x,y[,1])
lines(x,y[,2])
dev.off()

# change from baseline
x = 1:4
y = log(x)
CairoPNG("change_from_baseline.png",width=64, height=64)
par(mar=c(0.1,0.1,0.1,0.1))
plot(x,y,"l",xlim=c(1,5),ylim=c(-0.2,1.5),xlab="",ylab="",yaxt="n",xaxt="n")
CurlyBraces(4.3,0.7,1.4)
dev.off()



