[1mdiff --git a/src/index.html b/src/index.html[m
[1mindex 14a5805..9ceb3a1 100644[m
[1m--- a/src/index.html[m
[1m+++ b/src/index.html[m
[36m@@ -35,6 +35,7 @@[m
   </script>[m
   <script src="scripts/utils.js"></script>[m
   <script src="scripts/drag.js"></script>[m
[32m+[m[32m  <script src="scripts/circle.js"></script>[m
   <script src="scripts/moonplot.js"></script>[m
   <script src="scripts/labeler.js"></script>[m
 </html>[m
[1mdiff --git a/src/scripts/drag.coffee b/src/scripts/drag.coffee[m
[1mindex cb3e7ec..308879f 100644[m
[1m--- a/src/scripts/drag.coffee[m
[1m+++ b/src/scripts/drag.coffee[m
[36m@@ -6,6 +6,7 @@[m [msetupDragAndDrop = (svg,[m
                     xCenter,[m
                     yCenter) ->[m
 [m
[32m+[m
   dragStart = () ->[m
     svg.selectAll('.core-link').remove()[m
     svg.selectAll('.surface-link').remove()[m
[1mdiff --git a/src/scripts/moonplot.coffee b/src/scripts/moonplot.coffee[m
[1mindex e159e5b..99dc88b 100644[m
[1m--- a/src/scripts/moonplot.coffee[m
[1m+++ b/src/scripts/moonplot.coffee[m
[36m@@ -112,22 +112,9 @@[m [mHTMLWidgets.widget[m
     yCenter = 300[m
     radius = Math.min(height, width) / 3[m
 [m
[31m-    mouseDownEvent = ->[m
[31m-[m
[31m-    svgContainer.append('circle')[m
[31m-                .attr('cx', xCenter)[m
[31m-                .attr('cy', yCenter)[m
[31m-                .attr('r', radius)[m
[31m-                .style('fill', 'none')[m
[31m-                .style('stroke', 'black')[m
[31m-                .style 'fill-opacity', 0.2[m
[31m-                .on('mousedown', mouseDownEvent)[m
[31m-[m
[31m-[m
[31m-    # Add cross to middle of circle[m
[32m+[m[32m    drawCircle(svgContainer, xCenter, yCenter, radius)[m
     drawCross(svgContainer, xCenter, yCenter)[m
 [m
[31m-[m
     # Lunar core labels[m
     i = 0[m
     anchor_array = [][m
