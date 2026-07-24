// SCORM 1.2 and 2004 Run-Time API Implementation

export class ScormRuntime {
  constructor(onStateChange, initialData = {}) {
    this.onStateChange = onStateChange;
    this.state = {
      'cmi.core.lesson_status': 'not attempted',
      'cmi.core.lesson_location': '',
      'cmi.core.score.raw': '0',
      'cmi.core.score.max': '100',
      'cmi.core.score.min': '0',
      'cmi.core.session_time': '00:00:00',
      'cmi.core.total_time': '00:00:00',
      'cmi.core.student_id': 'emp-01',
      'cmi.core.student_name': 'Sarah Chen',
      'cmi.suspend_data': '',
      
      // SCORM 2004 mappings
      'cmi.completion_status': 'unknown',
      'cmi.success_status': 'unknown',
      'cmi.score.raw': '0',
      'cmi.score.scaled': '0.0',
      'cmi.location': '',
      'cmi.session_time': 'PT0S',
      ...initialData,
    };
    
    this.logs = [];
    this.isInitialized = false;
  }

  log(action, key, value, status = 'true') {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift({ timestamp, action, key, value, status });
    if (this.onStateChange) {
      this.onStateChange({
        state: { ...this.state },
        logs: [...this.logs]
      });
    }
  }

  initializeAPI(windowObj) {
    const self = this;

    // SCORM 1.2 API
    windowObj.API = {
      LMSInitialize: (param) => {
        self.isInitialized = true;
        self.log('LMSInitialize', '', param);
        return 'true';
      },
      LMSFinish: (param) => {
        self.isInitialized = false;
        self.log('LMSFinish', '', param);
        return 'true';
      },
      LMSGetValue: (key) => {
        const val = self.state[key] || '';
        self.log('LMSGetValue', key, val);
        return val;
      },
      LMSSetValue: (key, val) => {
        self.state[key] = String(val);
        
        // Handle automated rules
        if (key === 'cmi.core.lesson_status' && val === 'completed') {
          // Trigger completion actions if needed
        }
        
        self.log('LMSSetValue', key, val);
        return 'true';
      },
      LMSCommit: (param) => {
        self.log('LMSCommit', '', param);
        return 'true';
      },
      LMSGetLastError: () => '0',
      LMSGetErrorString: (errCode) => 'No error',
      LMSGetDiagnostic: (errCode) => 'No error diagnostic'
    };

    // SCORM 2004 API
    windowObj.API_1484_11 = {
      Initialize: (param) => {
        self.isInitialized = true;
        self.log('Initialize', '', param);
        return 'true';
      },
      Terminate: (param) => {
        self.isInitialized = false;
        self.log('Terminate', '', param);
        return 'true';
      },
      GetValue: (key) => {
        const val = self.state[key] || '';
        self.log('GetValue', key, val);
        return val;
      },
      SetValue: (key, val) => {
        self.state[key] = String(val);
        
        // Sync values to 1.2 counterparts for simplicity of display
        if (key === 'cmi.completion_status') {
          self.state['cmi.core.lesson_status'] = val === 'completed' ? 'completed' : 'incomplete';
        }
        if (key === 'cmi.success_status') {
          if (val === 'passed') self.state['cmi.core.lesson_status'] = 'passed';
          if (val === 'failed') self.state['cmi.core.lesson_status'] = 'failed';
        }
        if (key === 'cmi.score.raw') {
          self.state['cmi.core.score.raw'] = val;
        }
        if (key === 'cmi.location') {
          self.state['cmi.core.lesson_location'] = val;
        }

        self.log('SetValue', key, val);
        return 'true';
      },
      Commit: (param) => {
        self.log('Commit', '', param);
        return 'true';
      },
      GetLastError: () => '0',
      GetErrorString: (errCode) => 'No error',
      GetDiagnostic: (errCode) => 'No error diagnostic'
    };
  }
}
