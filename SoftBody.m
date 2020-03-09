%% Deformable object with interconnected mass-spring-damper
%
%  Author : MT-gang
%  Note   : Soft body simulation
%

%% Data structures for the nodes
%  nodes.r
%  nodes.c
%  nodes.point.intialPos
%  nodes.point.pos
%  nodes.point.force
%  nodes.point.vel
%  nodes.point.acc
%
% 8 interconnections:
%  O   O   O
%    \ | /
%  O---O---O
%    / | \
%  O   O   O


%%
function msd()
% This is the main function

% Warning! This clears everything!
clf;
clc;
clear all;
close all;
% For plotting purpose, we will aslo display the current simulation
% time
S.h = plot(0, 0);
S.mText = uicontrol('style','text');

xlabel('meter');
ylabel('meter');

% Parameters
row = 10;
col = 10;
stiffness = -600;    % N/m
damping =  -1;      % Ns/m
mass = 1;        % Kg
ts = 0.005;         % Seconds

% Build the nodes and the canvas
nodes = buildnodes(row, col);
canvas = createCanvas(nodes);
canvas = drawnodes(S, canvas, nodes, 0);

% This is the main iterations
for i = 0 : 10000
    nodes = updatepoint(nodes, mass, stiffness, damping, ts);
    if mod(i, 10) == 0
        canvas = drawnodes(S, canvas, nodes, ts*i);
    end
end

end

%%
function nodes = buildnodes(row, col)
% Build the nodes
nodes.row = row;
nodes.col = col;

for c = 1: col
    for r = 1 : row
        point(r,c).initalPos = [(c - 1) (r - 1)+10 ]; % 1 cm step
        point(r,c).pos = point(r,c).initalPos;
        point(r,c).acc = [0 0];
        point(r,c).vel = [0 0];
        
        % The last row is fixed
        
    end
end

nodes.point = point;
end

%%
function nodes = updatepoint(nodes, mass, stiffness, damping, ts)
% Update all nodes per time sampling
row = nodes.row;
col = nodes.col;
point = nodes.point;

% Force update
% Calculate force on each point
for r = 1 : row
    nextRow = r + 1;
    prevRow = r - 1;
    
    for c = 1 : col
        nextCol = c + 1;
        prevCol = c - 1;
        
        f1 = [0 0];
        f2 = [0 0];
        f3 = [0 0];
        f4 = [0 0];
        f5 = [0 0];
        f6 = [0 0];
        f7 = [0 0];
        f8 = [0 0];
        
        % Link 1
        if (r < row && c > 1)
            l0 = point(r, c).initalPos - point(nextRow, prevCol).initalPos;
            lt = point(r, c).pos - point(nextRow, prevCol).pos;
            n = norm(lt, 2);
            f1 = stiffness * (n - norm(l0, 2)) * lt / n;
        end
        
        % Link 2
        if (r < row)
            l0 = point(r, c).initalPos - point(nextRow, c).initalPos;
            lt = point(r, c).pos - point(nextRow, c).pos;
            n = norm(lt, 2);
            f2 = stiffness * (n - norm(l0, 2)) * lt / n;
        end
        
        % Link 3
        if (c < col)
            l0 = point(r, c).initalPos - point(r, nextCol).initalPos;
            lt = point(r, c).pos - point(r, nextCol).pos;
            n = norm(lt, 2);
            f3 = stiffness * (n - norm(l0, 2)) * lt / n;
        end
        
        % Link 4
        if (r > 1 && c < col)
            l0 = point(r, c).initalPos - point(prevRow, nextCol).initalPos;
            lt = point(r, c).pos - point(prevRow, nextCol).pos;
            n = norm(lt, 2);
            f4 = stiffness * (n - norm(l0, 2)) * lt / n;
        end
        
        % Link 5
        if (r > 1)
            l0 = point(r, c).initalPos - point(prevRow, c).initalPos;
            lt = point(r, c).pos - point(prevRow, c).pos;
            n = norm(lt, 2);
            f5 = stiffness * (n - norm(l0, 2)) * lt / n;
        end
        
        % Link 6
        if (c > 1)
            l0 = point(r, c).initalPos - point(r, prevCol).initalPos;
            lt = point(r, c).pos - point(r, prevCol).pos;
            n = norm(lt, 2);
            f6 = stiffness * (n - norm(l0, 2)) * lt / n;
        end
        
        % Link 7
        if (r < row && c < col)
            l0 = point(r, c).initalPos - point(nextRow, nextCol).initalPos;
            lt = point(r, c).pos - point(nextRow, nextCol).pos;
            n = norm(lt, 2);
            f7 = stiffness * (n - norm(l0, 2)) * lt / n;
        end
        
        % Link 8
        if (r > 1 && c > 1)
            l0 = point(r, c).initalPos - point(prevRow, prevCol).initalPos;
            lt = point(r, c).pos - point(prevRow, prevCol).pos;
            n = norm(lt, 2);
            f8 = stiffness * (n - norm(l0, 2)) * lt / n;
        end
        
        point(r,c).force =  f1 + f2 + f3 + f4 + f5 + f6 + f7 + f8 + ...
            damping * point(r,c).vel + mass * [0 -9.81];
        logging = mass * [0 -9.81]
    end
end

% Position, velocity, and acceelleration update
for r = 1 : row
    for c = 1: col
        point(r,c).acc = point(r,c).force ./ mass;
        point(r,c).vel = point(r,c).vel + point(r,c).acc .* ts;
        point(r,c).pos = point(r,c).pos + point(r,c).vel .* ts;
        if point(r,c).pos(2) <= 0.001
            point(r,c).pos = point(r,c).pos - point(r,c).vel .* ts;
            %point(r,c).vel(2) = -point(r,c).vel(2);
        end
    end 
end


nodes.point = point;
end

%%
function canvas = createCanvas(nodes)
% Graphic thingy
index = 1;
for c = 1 : nodes.col
    for r = 1 : nodes.row
        canvas(index,:) = nodes.point(r, c).pos;
        index = index + 1;
    end
end

canvas_min = min(canvas);
canvas_max = max(canvas);
range = canvas_max - canvas_min;

xlim([canvas_min(1)-range(1) canvas_max(1)+range(1)])
% ylim([canvas_min(2)-range(2) canvas_max(2)+range(2)])
ylim([0 canvas_max(2)+range(2)])
axis equal
end

%%
function canvas = drawnodes(S, canvas, nodes, timestamp)
% Draw the nodes
index = 1;
for c = 1 : nodes.col
    % Vertical line, going down
    for r = nodes.row : -1 : 1
        canvas(index, :) = nodes.point(r, c).pos;
        index = index + 1;
    end
    
    % Zig-zag line, going up
    for r = 1 : nodes.row
        canvas(index,:) = nodes.point(r,c).pos;
        index = index + 1;
        if (c < nodes.col)
            canvas(index ,:) = nodes.point(r, c + 1).pos;
            index = index + 1;
        end
    end
end
set(S.h, 'XData', canvas(:,1));
set(S.h, 'YData', canvas(:,2));
set(S.mText,'String', timestamp);
%plot a line on the floor collision
drawnow;
end
