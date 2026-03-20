// @ts-nocheck
import * as cheerio from 'cheerio';

export async function parseUserInfo(response) {
    try {
        const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
        if (!match || !match[1]) {
            return { error: "Failed to extract user details", status: 404 };
        }
        const encodedHtml = match[1];
        const decodedHtml = encodedHtml
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\\\/g, "")
            .replace(/\\'/g, "'");
        const $ = cheerio.load(decodedHtml);
        const getText = (selector) => $(selector).text().trim();
        const userInfo = {
            regNumber: getText('td:contains("Registration Number:") + td strong'),
            name: getText('td:contains("Name:") + td strong'),
            mobile: getText('td:contains("Mobile:") + td strong'),
            section: getText('td:contains("Department:") + td strong')
                .split("-")[1]
                .replace("(", "")
                .replace(")", "")
                .replace("Section", "")
                .trim(),
            program: getText('td:contains("Program:") + td strong'),
            department: getText('td:contains("Department:") + td strong')
                .split("-")[0]
                .trim(),
            semester: getText('td:contains("Semester:") + td strong'),
            batch: getText('td:contains("Batch:") + td strong font'),
        };
        return { userInfo, status: 200 };
    }
    catch (error) {
        console.error("Error parsing user info:", error);
        return { error: "Failed to parse user info", status: 500 };
    }
}

export async function parseDayOrder(response) {
    try {
        const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
        if (!match || !match[1]) {
            return { error: "Failed to extract dayOrder details", status: 404 };
        }
        const encodedHtml = match[1];
        const decodedHtml = encodedHtml
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\\\/g, "")
            .replace(/\\'/g, "'");
        const $ = cheerio.load(decodedHtml);
        let dayOrderText = "";
        let dayOrder = "-";
        $("span.highlight font[color='yellow']").each((_, el) => {
            const text = $(el).text().trim();
            if (text.startsWith("Day Order:")) {
                dayOrderText = text.replace("Day Order:", "").trim();
            }
        });
        for (const order of ["1", "2", "3", "4", "5"]) {
            if (dayOrderText.includes(order)) {
                dayOrder = order;
                break;
            }
        }
        return { dayOrder, status: 200 };
    }
    catch (error) {
        console.error("Error parsing day order:", error);
        return { error: "Failed to parse day order", status: 500 };
    }
}

export async function parseAttendance(response) {
    try {
        const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
        if (!match || !match[1]) {
            return { error: "Failed to extract attendance data", status: 404 };
        }
        const encodedHtml = match[1];
        const decodedHtml = encodedHtml
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\\\/g, "")
            .replace(/\\'/g, "'");

        let html = decodedHtml.replace(/<td\s+bgcolor='#E6E6FA'\s+style='text-align:center'> - <\/td>/g, "");
        const tableStart = '<table style="font-size :16px;" border="1" align="center" cellpadding="1" cellspacing="1" bgcolor="#FAFAD2">';
        let tableHtml = html.split(tableStart)[1];
        if (!tableHtml) return { error: "Failed to extract attendance table", status: 500 };
        tableHtml = tableStart + tableHtml.split("</table>")[0] + "</table>";

        const $ = cheerio.load(tableHtml);
        const attendances = [];

        $("tr").each((i, row) => {
            if (i === 0) return;
            const cols = $(row).find("td[bgcolor='#E6E6FA']");
            if (cols.length === 0 || $(cols[0]).text().trim() === " - ") return;

            const courseCode = $(cols[0]).text().trim().replace(/Regular/gi, '');
            if (/^\d.*/.test(courseCode) || $(cols[0]).text().toLowerCase().includes("regular")) {
                const courseTitle = $(cols[1]).text().split(" \u2013")[0].trim();
                const conducted = parseFloat($(cols[6]).text().trim()) || 0;
                const absent = parseFloat($(cols[7]).text().trim()) || 0;
                let percentage = 0;
                if (conducted !== 0) {
                    percentage = ((conducted - absent) / conducted) * 100;
                }

                if (courseTitle.toLowerCase() !== "null") {
                    attendances.push({
                        courseCode,
                        courseTitle,
                        conducted: conducted.toString(),
                        absent: absent.toString(),
                        attended: (conducted - absent).toString(),
                        percentage: percentage.toFixed(2)
                    });
                }
            }
        });

        return { data: attendances, status: 200 };
    }
    catch (error) {
        console.error("Error parsing attendance:", error);
        return { error: "Failed to parse attendance", status: 500 };
    }
}

export async function parseCalendar(response) {
    try {
        let rawResponse = response || "";
        if (typeof rawResponse !== "string") {
            rawResponse = JSON.stringify(rawResponse);
        }

        let htmlContent = null;
        if (rawResponse.includes("<table bgcolor=")) {
            htmlContent = rawResponse;
        } else if (rawResponse.includes('zmlvalue="')) {
            // Revert to GoScraper's exact trailing delimiter to prevent unescaped double quotes internally from severing the payload
            const encoded = rawResponse.split('zmlvalue="')[1].split('" > </div> </div>')[0];
            htmlContent = encoded
                .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
                .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
                .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
                .replace(/\\\\/g, "\\")
                .replace(/\\"/g, '"')
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"');
        } else {
            const match = rawResponse.match(/pageSanitizer\.sanitize\s*\(\s*['"](.+?)['"]\s*\)/s);
            if (match && match[1]) {
                htmlContent = match[1]
                    .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
                    .replace(/\\\\/g, "\\")
                    .replace(/\\'/g, "'")
                    .replace(/\\"/g, '"')
                    .replace(/\\n/g, "\n")
                    .replace(/\\t/g, "\t");
            }
        }

        if (!htmlContent && rawResponse.includes("<table")) {
            htmlContent = rawResponse;
        }

        if (!htmlContent) return { error: "Failed to extract calendar HTML payload", status: 404 };

        const $ = cheerio.load(htmlContent);
        const monthHeaders = [];

        $("th").each((i, el) => {
            const monthText = $(el).text().trim();
            // GoScraper explicitly relied on finding "'2" to signify the century headers (like "'24"). E.g sometimes SRM sends purely numerical spans without letters.
            if (monthText.includes("'2") || monthText.includes("202")) {
                monthHeaders.push(monthText);
            }
        });

        // Debug fallback to expose the actual HTML payload if headers couldn't be parsed
        if (monthHeaders.length === 0) {
            return {
                error: "No table headers could be parsed on the Calendar DOM",
                details: `Snippet Extracted (Length: ${htmlContent.length}): ` + htmlContent.substring(0, 150),
                status: 404
            };
        }

        const data = monthHeaders.map(m => ({ name: m, days: [] }));

        $("table tr").each((i, row) => {
            const tds = $(row).find("td");
            monthHeaders.forEach((month, idx) => {
                const pad = idx > 0 ? idx * 5 : 0;

                // Securely extract texts preventing undefined DOM queries
                const dateText = tds.eq(pad).text().trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
                const eventsText = tds.eq(pad + 2).text().trim();
                const dayOrderText = tds.eq(pad + 3).text().trim();

                if (dateText && /^\d+$/.test(dateText)) {
                    data[idx].days.push({
                        date: dateText,
                        dayOrder: dayOrderText === "-" ? "" : dayOrderText,
                        events: eventsText === "-" ? "" : eventsText
                    });
                }
            });
        });

        return { months: data, status: 200 };
    } catch (error) {
        console.error("Error parsing calendar:", error);
        return { error: "Failed to parse calendar", status: 500 };
    }
}

export async function parseMarks(response) {
    try {
        const attResult = await parseAttendance(response);
        const courseMap = {};
        if (attResult.data) {
            attResult.data.forEach((att: any) => {
                courseMap[att.courseCode] = att.courseTitle;
            });
        }

        const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
        if (!match || !match[1]) return { error: "Failed to extract marks data", status: 404 };

        const encodedHtml = match[1];
        const decodedHtml = encodedHtml
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\\\/g, "")
            .replace(/\\'/g, "'");

        const tablePart1 = decodedHtml.split('<table border="1" align="center" cellpadding="1" cellspacing="1">')[1];
        if (!tablePart1) return { error: "Failed to find marks main table", status: 500 };
        const exactHtml = '<table border="1" align="center" cellpadding="1" cellspacing="1">' + tablePart1.split('<table  width=800px;"border="0"cellspacing="1"cellpadding="1">')[0].split('<br />')[0];

        let cleanHtml = exactHtml.replace(/<table style="font-size" :6;="" border="2" cellpadding="1" cellspacing="1"><tbody><tr><td>/g, "");
        cleanHtml = cleanHtml.replace(/<\/td><\/tr>/g, "");
        const rowsTables = cleanHtml.split("</table></td>");

        const marksData = [];
        rowsTables.forEach(tableStr => {
            if (!tableStr.trim()) return;
            const $ = cheerio.load(tableStr + "</table>");
            $("tr").each((i, row) => {
                const cells = $(row).find("td");
                if (cells.length < 3) return;
                const courseCode = $(cells[0]).text().trim();
                const courseType = $(cells[1]).text().trim();
                if (!courseCode || !courseType) return;

                const testPerformance = [];

                $(cells[2]).find("table td").each((_, testCell) => {
                    const testText = $(testCell).text().trim().split(".00");
                    if (testText.length >= 2) {
                        const testNameParts = testText[0].split("/");
                        const testTitle = testNameParts[0].trim();
                        const total = parseFloat(testNameParts[1]) || 0;
                        const scoredStr = testText[1].trim();
                        const scored = parseFloat(scoredStr) || 0;

                        testPerformance.push({
                            eventName: testTitle,
                            mark: scoredStr === "Abs" ? "Abs" : scored.toFixed(2),
                            maxMark: total.toFixed(2)
                        });
                    }
                });

                if (testPerformance.length > 0) {
                    marksData.push({
                        courseTitle: courseMap[courseCode] || courseCode,
                        courseCode: courseCode,
                        courseType: courseType,
                        marks: testPerformance
                    });
                }
            });
        });

        const sortedMarks = marksData.filter(m => m.courseType === "Theory").concat(marksData.filter(m => m.courseType === "Practical"));

        return { data: sortedMarks, status: 200 };
    } catch (error) {
        console.error("Error parsing marks:", error);
        return { error: "Failed to parse marks", status: 500 };
    }
}

export async function parseTimetable(response) {
    try {
        const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
        if (!match || !match[1]) return { error: "Failed to extract Timetable data", status: 404 };

        const encodedHtml = match[1];
        const decodedHtml = encodedHtml
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\\\/g, "")
            .replace(/\\'/g, "'");

        const $ = cheerio.load(decodedHtml);

        let batchStr = "1";
        $('td:contains("Batch:") + td strong font').each((_, el) => {
            batchStr = $(el).text().trim();
        });
        const batchNum = parseInt(batchStr) || 1;

        const courses = [];
        let htmlParts = decodedHtml.split('<table cellspacing="1" cellpadding="1" border="1" align="center" style="width:900px!important;" class="course_tbl">');
        if (htmlParts.length > 1) {
            let tableHtml = htmlParts[1].split("</table>")[0];
            const $t = cheerio.load(`<table>${tableHtml}</table>`);
            $t("tr").each((i, row) => {
                if (i === 0) return;
                const cells = $t(row).find("td");
                if (cells.length < 10) return;

                const code = $t(cells[1]).text().trim();
                const title = $t(cells[2]).text().split(" \u2013")[0].trim();
                const type = $t(cells[6]).text().trim();
                const slotText = $t(cells[8]).text().trim().replace(/-$/, "");
                const room = $t(cells[9]).text().trim();

                if (code && slotText) {
                    const slots = slotText.includes("-") ? slotText.split("-") : [slotText];
                    slots.forEach(slot => {
                        courses.push({
                            code, title, type, slot, room
                        });
                    });
                }
            });
        }

        const batch1 = {
            "1": ["A", "A", "F", "F", "G", "P6", "P7", "P8", "P9", "P10"],
            "2": ["P11", "P12", "P13", "P14", "P15", "B", "B", "G", "G", "A"],
            "3": ["C", "C", "A", "D", "B", "P26", "P27", "P28", "P29", "P30"],
            "4": ["P31", "P32", "P33", "P34", "P35", "D", "D", "B", "E", "C"],
            "5": ["E", "E", "C", "F", "D", "P46", "P47", "P48", "P49", "P50"]
        };
        const batch2 = {
            "1": ["P1", "P2", "P3", "P4", "P5", "A", "A", "F", "F", "G"],
            "2": ["B", "B", "G", "G", "A", "P16", "P17", "P18", "P19", "P20"],
            "3": ["P21", "P22", "P23", "P24", "P25", "C", "C", "A", "D", "B"],
            "4": ["D", "D", "B", "E", "C", "P36", "P37", "P38", "P39", "P40"],
            "5": ["P41", "P42", "P43", "P44", "P45", "E", "E", "C", "F", "D"]
        };

        const selectedBatch = batchNum === 2 ? batch2 : batch1;

        const mappedSchedule = {};
        for (let day = 1; day <= 5; day++) {
            const daySlots = selectedBatch[day.toString()];
            const dayTable = [];
            for (const slotKey of daySlots) {
                const matchingCourses = courses.filter(c => c.slot === slotKey);
                if (matchingCourses.length > 0) {
                    dayTable.push({
                        code: [...new Set(matchingCourses.map(c => c.code))].join("/"),
                        title: [...new Set(matchingCourses.map(c => c.title))].join("/"),
                        room: [...new Set(matchingCourses.map(c => c.room))].join("/"),
                        slot: slotKey
                    });
                } else {
                    dayTable.push(null);
                }
            }
            mappedSchedule[day.toString()] = dayTable;
        }

        return { schedule: mappedSchedule, status: 200 };
    } catch (error) {
        console.error("Error parsing timetable:", error);
        return { error: "Failed to parse timetable", status: 500 };
    }
}

