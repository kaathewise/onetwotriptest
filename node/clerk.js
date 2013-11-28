module.exports = Clerk;

function Clerk() {
    var self = this instanceof Clerk
        ? this
        : Object.create(Clerk.prototype);

    var tasks = {};

    self.addTask = addTask;
    self.getStatus = getStatus;

    function addTask(task, ttl) {
        var sid = generateSid();
        tasks[sid] = {
            executing: true,
            ttl: ttl
        };
        setExpiration(sid);
        task(taskFinished.bind(null, sid));
        return { sid: sid };
    }

    function taskFinished (sid, err, result) {
        if (!tasks[sid]) return;
        tasks[sid].executing = false;
        if (err) {
            tasks[sid].error = err;
        } else {
            tasks[sid].result = result;
        }
    }

    function getStatus(sid) {
        if (tasks[sid]) {
            return { task: tasks[sid] };
        } else {
            return { error: 'bad_sid' };
        }
    }

   function setExpiration(sid) {
        if (!tasks[sid]) return;
        setTimeout(function () {
            tasks[sid] && delete tasks[sid]
        }, tasks[sid].ttl);
    }

    function generateSid() {
        while (true) {
            var sid = Math.floor(Math.random() * 1000000);
            if (!tasks[sid]) return sid;
        }
    }

    return self;
}
